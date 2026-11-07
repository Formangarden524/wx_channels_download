package hermes

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFinalizeReplacesTrackedOutput(t *testing.T) {
	root := t.TempDir()
	if err := os.Mkdir(filepath.Join(root, "author"), 0755); err != nil {
		t.Fatal(err)
	}
	name := filepath.Join("author", "video.mp4")
	target := filepath.Join(root, name)
	staged := filepath.Join(root, "staged.mp4")
	for path, contents := range map[string]string{target: "original", staged: "replacement"} {
		if err := os.WriteFile(path, []byte(contents), 0600); err != nil {
			t.Fatal(err)
		}
	}
	engine := &HermesEngine{}
	job := &TaskJob{
		Platform:    "wxchannels",
		DownloadDir: root,
		Config: map[string]any{
			"overwrite":                    true,
			"wxchannels_overwrite_targets": map[string]any{"video-id": name},
		},
		Resources: []ResourceJob{{Name: name, Kind: "video/mp4", UniqueID: "video-id", FilePath: staged}},
	}
	engine.finalize_resource_filenames(job)
	actual, err := os.ReadFile(target)
	if err != nil || string(actual) != "replacement" {
		t.Fatalf("expected replacement at the original path, got %q (%v)", actual, err)
	}
	entries, err := os.ReadDir(filepath.Dir(target))
	if err != nil || len(entries) != 1 {
		t.Fatalf("expected one file in author directory, got %v (%v)", entries, err)
	}
}
